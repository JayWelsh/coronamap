import React, { useState, useEffect } from 'react'
import { Map, TileLayer, Tooltip, CircleMarker, GeoJSON } from 'react-leaflet'
import Control from './LeafletControl';
import Fab from '@material-ui/core/Fab';
import DarkModeIcon from '@material-ui/icons/Brightness3';
import LightModeIcon from '@material-ui/icons/Brightness5';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import BorderChartIcon from '@material-ui/icons/GridOn';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import SouthAfrica from "../south-africa-metadata.json";
import geojson from '../json/south-africa-geojson.json';
import { isConsideredMobile } from "../utils";

const MapBackgroundProvider = styled.div`
    & > .leaflet-container {
        background-color: ${props => props.darkMode ? "rgb(38, 38, 38)!important" : "#d5e8eb!important"};
    }
`

const LegendColorSquare = styled.div`
    height: 15px;
    width: 15px;
    margin-right: 5px;
    background-color: ${props => props.color};
    display: inline-block;
`

let position = [-28.738176, 24.767929];
let options = {
    style: {
      height: isConsideredMobile() ? 'calc(var(--vh, 1vh) * 100 - 56px)' : 'calc(var(--vh, 1vh) * 100 - 64px)',
      width: '100%',
    },
    center: position,
    zoom: isConsideredMobile() ? 4.5 : 6,
    minZoom: isConsideredMobile() ? 4.5 : 5.5,
    maxZoom: 8,
    zoomSnap: 0.5,
}

export const OurMap = ({ groupedByProvince }) => {

    let [markers, setMarkers] = useState(false);
    let [darkMode, setDarkMode] = useState(true);
    let [bubbleChart, setBubbleChart] = useState(true);
    
    useEffect(() => {
        let markers = [];
        let maxRadius = isConsideredMobile() ? 20 : 50;
        let minRadius = isConsideredMobile() ? 10 : 15;
        let radiusDelta = maxRadius - minRadius;
        let reachMaxRadiusAt = 61;
        let { provinces } = SouthAfrica;
        for (let province of Object.keys(provinces)) {
            if (groupedByProvince[province]) {
            let provinceCaseCount = groupedByProvince[province].length;
            let setRadius = minRadius + (((provinceCaseCount * 100 / reachMaxRadiusAt) / 100) * radiusDelta);
            markers.push({
                position: provinces[province].position,
                color: "#ff0081",
                radius: setRadius,
                tooltipText: (
                    <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                        <sup>{provinces[province].name}</sup><br />
                        <b>{provinceCaseCount}</b> {provinceCaseCount > 1 ? "Cases" : "Case"}
                    </Typography>
                )
            })
            } else {
            markers.push({
                position: provinces[province].position,
                color: "green",
                radius: minRadius,
                tooltipText: (
                    <h3 class="white-monospace line-height-1 no-margin normal-font-weight">
                        <sup>{provinces[province].name}</sup><br />
                        <b>0</b> Cases
                    </h3>
                )
            })
            }
        }
        setMarkers(markers);
    }, [groupedByProvince]);

    const style = (feature) => {
        return {
            weight: 2,
            opacity: 1,
            color: darkMode ? 'white' : 'black',
            dashArray: '3',
            fillOpacity: 0.9,
            fillColor: getColor(feature.properties.NAME_1)
        };
    }

    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.NAME_1) {
            let provinceCaseCount = 0;
            let provinceName = feature.properties.NAME_1;
            if(groupedByProvince[SouthAfrica.provinceNameToAbbreviation[provinceName]]) {
                provinceCaseCount = groupedByProvince[SouthAfrica.provinceNameToAbbreviation[provinceName]].length;
            }else{
                provinceCaseCount = 0;
            }
            layer.bindTooltip(`<h3 class="white-monospace line-height-1 no-margin normal-font-weight"><sup>${feature.properties.NAME_1}</sup><br/><b>${provinceCaseCount}</b>${(provinceCaseCount > 1 || provinceCaseCount === 0) ? " Cases" : " Case"}</h3>`, {
                sticky: true,
                className: "our-tooltip white-monospace",
                direction: "auto",
            });
        }
    }
    
    const getColor = (provinceName) => {
        let infectionCount = 0;
        if(groupedByProvince[SouthAfrica.provinceNameToAbbreviation[provinceName]]) {
            infectionCount = groupedByProvince[SouthAfrica.provinceNameToAbbreviation[provinceName]].length;
        }
        return  infectionCount > 250000  ? '#800026' :
                infectionCount > 50000   ? '#bd0026' :
                infectionCount > 15000   ? '#e31a1c' :
                infectionCount > 5000    ? '#fc4e2a' :
                infectionCount > 1000    ? '#fd8d3c' :
                infectionCount > 250     ? '#feb24c' :
                infectionCount > 50      ? '#fed976' :
                infectionCount >= 1       ? '#ffffcc' :
                'darkgreen';
    }

    if (typeof window !== 'undefined') {
        return (
            <MapBackgroundProvider darkMode={darkMode}>
                <Map {...options}>
                    <Control position="topright">
                        <div className="flex-column">
                            <Fab style={{marginBottom: '15px'}} onClick={() => setDarkMode(!darkMode)} aria-label="add">
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </Fab>
                            <Fab onClick={() => setBubbleChart(!bubbleChart)} aria-label="add">
                                {bubbleChart ? <BorderChartIcon /> : <BubbleChartIcon />}
                            </Fab>
                        </div>
                    </Control>
                    {!bubbleChart && 
                        <Control position="bottomright">
                            <Paper style={{padding: '10px'}}>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#800026'}/>250k+
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#bd0026'}/>50k-250k
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#e31a1c'}/>15k-50k
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fc4e2a'}/>5k-15k
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fd8d3c'}/>1k-5k
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#feb24c'}/>250-1k
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fed976'}/>50-250
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#ffffcc'}/>1-50
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'darkgreen'}/>0
                                </Typography>
                            </Paper>
                        </Control>
                    }
                    <TileLayer
                        attribution='Data by <a href="https://dsfsi.github.io/">dsfsi</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                    />
                    {!bubbleChart && <GeoJSON style={style} data={geojson} onEachFeature={onEachFeature}/>}
                    {
                        bubbleChart && markers && markers.map(marker => {
                            return (
                                <CircleMarker key={marker.position} center={marker.position} color={marker.color} radius={marker.radius}>
                                    <Tooltip sticky className={"our-tooltip"}>{marker.tooltipText}</Tooltip>
                                </CircleMarker>
                            )
                        })
                    }
                </Map>
            </MapBackgroundProvider>
        )
    }
    return null
}

export default OurMap;