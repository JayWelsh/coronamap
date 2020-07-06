import React, { useState, useEffect } from 'react'
import { Map, TileLayer, Tooltip, CircleMarker, GeoJSON } from 'react-leaflet'
import Control from './LeafletControl';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import SouthAfrica from "../south-africa-metadata.json";
import geojson from '../json/south-africa-geojson.json';
import { isConsideredMobile } from "../utils";

const MapBackgroundProvider = styled.div`
    & > .leaflet-container {
        background-color: ${props => props.useLightMode ? "#d5e8eb!important" : "rgb(38, 38, 38)!important"};
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

export const OurMap = ({ provincialAggregate, mapType = "bubble", prefersLightMode = false, hospitalData }) => {

    let [markers, setMarkers] = useState(false);
    let [hospitalMarkers, setHospitalMarkers] = useState(false);
    let [useLightMode, setUseLightMode] = useState(prefersLightMode);
    let [useMapType, setUseMapType] = useState(mapType);

    useEffect(() => {
        if(prefersLightMode !== useLightMode){
            setUseLightMode(prefersLightMode);
        }
        if(mapType !== useMapType){
            setUseMapType(mapType);
        }
    }, [prefersLightMode, mapType, useLightMode, useMapType])
    
    useEffect(() => {
        let markers = [];
        let maxRadius = isConsideredMobile() ? 30 : 80;
        let minRadius = isConsideredMobile() ? 10 : 15;
        let radiusDelta = maxRadius - minRadius;
        let reachMaxRadiusAt = 0;
        let { provinces } = SouthAfrica;
        for(let provinceGroup of Object.keys(provincialAggregate)) {
            if(provincialAggregate[provinceGroup] > reachMaxRadiusAt) {
                reachMaxRadiusAt = provincialAggregate[provinceGroup];
            }
        }
        for (let province of Object.keys(provinces)) {
            if (provincialAggregate[province]) {
            let provinceCaseCount = provincialAggregate[province];
            let setRadius = minRadius + (((provinceCaseCount * 100 / reachMaxRadiusAt) / 100) * radiusDelta);
            markers.push({
                position: provinces[province].position,
                color: "#ff0081",
                radius: setRadius,
                tooltipText: (
                    <div>
                        <h4 className="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
                            {provinces[province].name}
                        </h4>
                        <h3 className="white-monospace line-height-1 no-margin normal-font-weight">
                            <b>{provinceCaseCount}</b> {provinceCaseCount > 1 ? "Cases" : "Case"}
                        </h3>
                    </div>
                )
            })
            } else {
            markers.push({
                position: provinces[province].position,
                color: "green",
                radius: minRadius,
                tooltipText: (
                    <div>
                        <h4 className="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
                            {provinces[province].name}
                        </h4>
                        <h3 className="white-monospace line-height-1 no-margin normal-font-weight">
                            <b>0</b> Cases
                        </h3>
                    </div>
                )
            })
            }
        }
        setMarkers(markers);
        // let hospitalMarkers = [];
        // for(let hospital of hospitalData) {
        //     hospitalMarkers.push({
        //         position: hospital.position,
        //         color: "green",
        //         radius: 5,
        //         tooltipText: (
        //             <div>
        //                 <h4 className="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
        //                     {hospital.name}
        //                 </h4>
        //             </div>
        //         )
        //     })
        // }
        // setHospitalMarkers(hospitalMarkers);
    }, [provincialAggregate]);

    const style = (feature) => {
        return {
            weight: 2,
            opacity: 1,
            color: useLightMode ? 'black' : 'white',
            dashArray: '3',
            fillOpacity: 0.9,
            fillColor: getColor(feature.properties.NAME_1)
        };
    }

    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.NAME_1) {
            let provinceCaseCount = 0;
            let provinceName = feature.properties.NAME_1;
            if(provincialAggregate[SouthAfrica.provinceNameToAbbreviation[provinceName]]) {
                provinceCaseCount = provincialAggregate[SouthAfrica.provinceNameToAbbreviation[provinceName]];
            }else{
                provinceCaseCount = 0;
            }
            layer.bindTooltip(`
                <div>
                    <h4 class="white-monospace line-height-1 normal-font-weight no-wrap our-tooltip-title-text">
                        ${feature.properties.NAME_1}
                    </h4>
                    <h3 class="white-monospace line-height-1 no-margin normal-font-weight">
                        <b>${provinceCaseCount}</b>${(provinceCaseCount > 1 || provinceCaseCount === 0) ? " Cases" : " Case"}
                    </h3>
                </div>
                `, {
                sticky: true,
                className: "our-tooltip white-monospace",
                direction: "auto",
            });
        }
    }
    
    const getColor = (provinceName) => {
        let infectionCount = 0;
        if(provincialAggregate[SouthAfrica.provinceNameToAbbreviation[provinceName]]) {
            infectionCount = provincialAggregate[SouthAfrica.provinceNameToAbbreviation[provinceName]];
        }
        return  infectionCount > 100000  ? '#800026' :
                infectionCount > 75000   ? '#bd0026' :
                infectionCount > 50000   ? '#e31a1c' :
                infectionCount > 25000    ? '#fc4e2a' :
                infectionCount > 10000    ? '#fd8d3c' :
                infectionCount > 5000     ? '#feb24c' :
                infectionCount > 1000      ? '#fed976' :
                infectionCount >= 1      ? '#ffffcc' :
                'darkgreen';
    }

    if (typeof window !== 'undefined') {
        return (
            <MapBackgroundProvider useLightMode={useLightMode}>
                <Map {...options}>
                    <Control position="bottomright">
                        <Typography className={`${useLightMode ? "black-monospace" : "white-monospace"} line-height-1`} variant="caption">
                            Touch map artifacts to interact
                        </Typography>
                    </Control>
                    {useMapType === "choropleth" && 
                        <Control position="bottomright">
                            <Paper style={{padding: '10px'}}>
                                <Typography className={"white-monospace line-height-1"} gutterBottom variant="h6" component="h2">
                                    Cases
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#800026'}/>100000+
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#bd0026'}/>75000-100000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#e31a1c'}/>50000-75000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fc4e2a'}/>25000-50000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fd8d3c'}/>10000-25000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#feb24c'}/>5000-10000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#fed976'}/>1000-5000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#ffffcc'}/>1-1000
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'darkgreen'}/>0
                                </Typography>
                            </Paper>
                        </Control>
                    }
                    {useMapType === "bubble" && 
                        <Control position="bottomright">
                            <Paper style={{padding: '10px'}}>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'#ff0081'}/>Cases
                                </Typography>
                                <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                                    <LegendColorSquare color={'green'}/>No Cases
                                </Typography>
                            </Paper>
                        </Control>
                    }
                    <TileLayer
                        attribution='Data by <a href="https://github.com/dsfsi/covid19za">dsfsi</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={useLightMode ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
                    />
                    {useMapType === "choropleth" && <GeoJSON style={style} data={geojson} onEachFeature={onEachFeature}/>}
                    {
                        useMapType === "bubble" && markers && markers.map(marker => {
                            return (
                                <CircleMarker key={marker.position} center={marker.position} color={marker.color} radius={marker.radius}>
                                    <Tooltip sticky className={"our-tooltip"}>{marker.tooltipText}</Tooltip>
                                </CircleMarker>
                            )
                        })
                    }
                    {
                        // useMapType === "hospital" && hospitalMarkers && hospitalMarkers.map(marker => {
                        //     return (
                        //         <CircleMarker key={marker.position} center={marker.position} color={marker.color} radius={marker.radius}>
                        //             <Tooltip sticky className={"our-tooltip"}>{marker.tooltipText}</Tooltip>
                        //         </CircleMarker>
                        //     )
                        // })
                    }
                </Map>
            </MapBackgroundProvider>
        )
    }
    return null
}

export default OurMap;