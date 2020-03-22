import React, { useState, useEffect, useRef } from 'react';
import { BarStackHorizontal } from '@vx/shape';
import { Group } from '@vx/group';
import { AxisBottom, AxisLeft } from '@vx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { withTooltip, Tooltip } from '@vx/tooltip';
import { LegendOrdinal } from '@vx/legend';

import { arrayIntoChunks, isConsideredMobile } from "../../utils";

const axisColor = 'white';

const parseDate = timeParse('%Y%m%d');
const format = timeFormat('%b %d');
const longFormat = timeFormat('%B %d %Y');
const formatDate = date => format(parseDate(date));
const longFormatDate = date => longFormat(parseDate(date));

// accessors
const y = d => d.date;

let tooltipTimeout;

export default withTooltip(
  ({
    width,
    height,
    events = false,
    margin = {
      top: 35,
      left: 60,
      right: 20,
      bottom: 20
    },
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
    data,
    colorRange = [],
    chartTitle,
    singularLabel,
    pluralLabel
  }) => {
    if (width < 10 || !data) return null;

    const mobile = isConsideredMobile();
    const fragmentLegend = mobile || (typeof window !== 'undefined' && window.innerWidth < 1280);
    const [legendHeight, setLegendHeight] = useState(50);
    const chartElement = useRef(false);
    const legendElement = useRef(false);
    const tooltipElement = useRef(false);

    useEffect(() => {
      let currentLegendHeight = legendElement.current.getBoundingClientRect().height;
      if (legendHeight !== currentLegendHeight) {
        setLegendHeight(currentLegendHeight);
      }
    }, [legendHeight])

    const keys = Object.keys(data[0]).filter(d => d !== 'date');

    const keyFragmentSize = fragmentLegend ? 3 : keys.length;
    const keyFragments = arrayIntoChunks(keys, keyFragmentSize);
    const keyFragmentColorRange = arrayIntoChunks(colorRange, keyFragmentSize);

    const color = scaleOrdinal({
      domain: keys,
      range: colorRange
    });

    const totals = data.reduce((ret, cur) => {
      const t = keys.reduce((dailyTotal, k) => {
        dailyTotal += +cur[k];
        return dailyTotal;
      }, 0);
      ret.push(t);
      return ret;
    }, []);

    // scales
    const xScale = scaleLinear({
      domain: [0, Math.max(...totals)],
      nice: true
    });
    const yScale = scaleBand({
      domain: data.map(y),
      padding: 0.2
    });

    // bounds
    const xMax = width - margin.left - margin.right;
    const yMax = (height - legendHeight) - margin.top - margin.bottom;

    xScale.rangeRound([0, xMax]);
    yScale.rangeRound([yMax, 0]);

    let tooltipTranslate = 'translateX(-50%)translateY(calc(-50% - 20px))';
    let tooltipAnimation = 'all .1s ease-out';

    return (
      <div ref={chartElement} style={{ position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ top: margin.top, position: 'relative' }} className="white-monospace center-text">
          {chartTitle}
        </h2>
        <svg width={width} height={height - legendHeight}>
          <Group top={20} left={margin.left}>
            <BarStackHorizontal
              data={data}
              keys={keys}
              height={yMax}
              y={y}
              xScale={xScale}
              yScale={yScale}
              color={color}
            >
              {barStacks => {
                return barStacks.map(barStack => {
                  return barStack.bars.map(bar => {
                    return (
                      <rect
                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                        onClick={event => {
                          if (!events) return;
                          alert(`clicked: ${JSON.stringify(bar)}`);
                        }}
                        onMouseLeave={event => {
                          tooltipTimeout = setTimeout(() => {
                            hideTooltip();
                          }, 1000);
                        }}
                        onMouseMove={event => {
                          if (tooltipTimeout) clearTimeout(tooltipTimeout);
                          let tooltipHeight = tooltipElement.current ? tooltipElement.current.getBoundingClientRect().height + 20 : 0;
                          let setTop = mobile ? bar.y + margin.top : bar.y + margin.top + (event.clientY - event.target.getBoundingClientRect().top);
                          if ((tooltipHeight - (bar.y + margin.top)) + 5 > setTop) {
                            setTop = tooltipHeight - (bar.y + margin.top) + 5
                          }
                          let halfTooltipWidth = tooltipElement.current ? tooltipElement.current.getBoundingClientRect().width / 2 : 0;
                          let setLeft = event.clientX;
                          if (tooltipElement.current && ((event.clientX + halfTooltipWidth) >= (width - margin.right))) {
                            setLeft = width - halfTooltipWidth - margin.right;
                          } else if (tooltipElement.current && (event.clientX - halfTooltipWidth) < margin.left) {
                            setLeft = margin.left + halfTooltipWidth;
                          } else if (!tooltipElement.current && mobile) {
                            setLeft = width / 2; // Put initial render in the middle to prevent initial render being off-page
                          }
                          showTooltip({
                            tooltipData: bar,
                            tooltipTop: setTop,
                            tooltipLeft: setLeft
                          });
                        }}
                      />
                    );
                  });
                });
              }}
            </BarStackHorizontal>
            <AxisLeft
              hideAxisLine={true}
              hideTicks={true}
              scale={yScale}
              tickFormat={formatDate}
              stroke={axisColor}
              tickStroke={axisColor}
              tickLabelProps={(value, index) => ({
                fill: axisColor,
                fontSize: 11,
                textAnchor: 'end',
                dy: '0.33em',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              })}
            />
            <AxisBottom
              top={yMax}
              scale={xScale}
              stroke={axisColor}
              tickStroke={axisColor}
              tickLabelProps={(value, index) => ({
                fill: axisColor,
                fontSize: 11,
                textAnchor: 'middle',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              })}
            />
          </Group>
        </svg>
        <div
          ref={legendElement}
          style={{
            top: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: axisColor,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          <div></div>
          <div>
            {
              keyFragments && keyFragments.map((item, index) => {
                let legendFragmentScale = scaleOrdinal({
                  domain: item,
                  range: keyFragmentColorRange[index]
                });
                let fontSize = mobile ? '11px' : '14px'
                return (
                  <LegendOrdinal key={JSON.stringify(item)} scale={legendFragmentScale} style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize }} direction="row" labelMargin="0 15px 0 0" />
                )
              })
            }
          </div>
          <div></div>
        </div>
        {tooltipOpen && (
          <Tooltip
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              minWidth: 60,
              backgroundColor: 'rgba(0,0,0,0.75)',
              color: 'white',
              transition: tooltipAnimation,
              transform: tooltipTranslate,
              padding: '0px',
            }}
          >
            <div style={{ padding: '0.3rem 0.5rem' }} ref={tooltipElement}>
              <h4 className="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
                <span style={{ backgroundColor: color(tooltipData.key), top: '2px', marginRight: '5px', height: '15px', width: '15px', display: 'inline-block', position: 'relative' }}></span>{tooltipData.key}
              </h4>
              <h4 className="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
                {longFormatDate(y(tooltipData.bar.data))}
              </h4>
              <h3 className="white-monospace line-height-1 no-margin normal-font-weight no-wrap">
                <b>{tooltipData.bar.data[tooltipData.key]}</b> {(tooltipData.bar.data[tooltipData.key] * 1) === 1 ? singularLabel : pluralLabel}
              </h3>
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);