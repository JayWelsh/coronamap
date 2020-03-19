import React, { Fragment } from 'react'
import { Map, TileLayer, Tooltip, Popup, CircleMarker } from 'react-leaflet'

export const OurMap = ({ options, markers = [] }) => {
    if (typeof window !== 'undefined') {
        return (
            <Fragment>
                <Map {...options}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
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
                </Map>
            </Fragment>
        )
    }
    return null
}

export default OurMap;