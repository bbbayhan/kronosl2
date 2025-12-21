
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { OrderBookSnapshot } from '../../entities/orderbookSnapshot';

interface DepthChartProps {
    snapshot: OrderBookSnapshot | null;
}

const DepthChart: React.FC<DepthChartProps> = ({ snapshot }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!snapshot || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };

        svg.selectAll("*").remove();

        const bids = [...snapshot.bids].sort((a, b) => b.price - a.price);
        const asks = [...snapshot.asks].sort((a, b) => a.price - b.price);

        const xExtent = d3.extent([...bids.map(d => d.price), ...asks.map(d => d.price)]) as [number, number];
        const yMax = Math.max(
            d3.max(bids, d => d.total) || 0,
            d3.max(asks, d => d.total) || 0
        );

        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, yMax * 1.1])
            .range([height - margin.bottom, margin.top]);

        // Draw area for bids
        const bidArea = d3.area<any>()
            .x(d => xScale(d.price))
            .y0(height - margin.bottom)
            .y1(d => yScale(d.total))
            .curve(d3.curveStepAfter);

        svg.append("path")
            .datum(bids)
            .attr("fill", "rgba(34, 197, 94, 0.2)")
            .attr("stroke", "#22c55e")
            .attr("stroke-width", 2)
            .attr("d", bidArea);

        // Draw area for asks
        const askArea = d3.area<any>()
            .x(d => xScale(d.price))
            .y0(height - margin.bottom)
            .y1(d => yScale(d.total))
            .curve(d3.curveStepAfter);

        svg.append("path")
            .datum(asks)
            .attr("fill", "rgba(239, 68, 68, 0.2)")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 2)
            .attr("d", askArea);

        // Axes
        const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => `$${d}`);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(xAxis)
            .attr("color", "#71717a");

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis)
            .attr("color", "#71717a");

    }, [snapshot]);

    return (
        <div className="w-full h-full bg-zinc-900/30 rounded-xl border border-zinc-800 p-4">
            <svg ref={svgRef} className="w-full h-full" />
        </div>
    );
};

export default DepthChart;
