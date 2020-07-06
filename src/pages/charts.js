import React, { Component, useState, useEffect } from "react";
import { ParentSize } from '@vx/responsive';

import Layout from "../components/layout";
import SEO from "../components/seo";
import OurHorizontalBarChart from "../components/vx/OurHorizontalBarChartVX";

const ChartsPage = () => {
  return (
    <Layout totalCases={202}>
        <SEO title="Charts" />
        <div style={{height: '500px'}}>
            <ParentSize className="graph-container">
                {({ width: w, height: h }) => {
                    return (
                        <OurHorizontalBarChart width={w} height={h}/>
                    )
                }}
            </ParentSize>
        </div>
    </Layout>
  )
}

export default ChartsPage