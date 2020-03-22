import React from 'react';
import { LinePath } from '@vx/shape';

export default ({data, label, yText, yScale, xScale, x, y}) => {
    return (
        <g>
            <LinePath
                data={data}
                yScale={yScale}
                xScale={xScale}
                x={x}
                y={y}
                strokeDasharray="4,4"
                stroke={"#424242"}
            />
            <text y={yText} fill="white" dy="1.3em" dx="1em" fontSize="14">
                {label}
            </text>
        </g>
    )
}