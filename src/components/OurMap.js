import React, { Fragment, useState } from 'react'
import { Map, TileLayer, Tooltip, Popup, CircleMarker, withLeaflet } from 'react-leaflet'
import Control from './LeafletControl';
import Fab from '@material-ui/core/Fab';
import DarkModeIcon from '@material-ui/icons/Brightness3';
import LightModeIcon from '@material-ui/icons/Brightness5';
import styled from 'styled-components';

const MapBackgroundProvider = styled.div`
    & > .leaflet-container {
        background-color: ${props => props.darkMode ? "rgb(38, 38, 38)!important" : "#d5e8eb!important"};
    }
`

export const OurMap = ({ options, markers = [] }) => {
    let [darkMode, setDarkMode] = useState(true);
    if (typeof window !== 'undefined') {
        return (
            <MapBackgroundProvider darkMode={darkMode}>
                <Map {...options}>
                    <TileLayer
                        attribution='Data by <a href="https://dsfsi.github.io/">dsfsi</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                    />
                    {
                        markers && markers.map(marker => {
                            return (
                                <CircleMarker key={marker.position} center={marker.position} color={marker.color} radius={marker.radius}>
                                    <Tooltip sticky className={"our-tooltip"}>{marker.tooltipText}</Tooltip>
                                </CircleMarker>
                            )
                        })
                    }
                    <Control position="topright">
                        <Fab onClick={() => setDarkMode(!darkMode)} aria-label="add">
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </Fab>
                    </Control>
                </Map>
            </MapBackgroundProvider>
        )
    }
    return null
}

export default withLeaflet(OurMap);