import ReactDOM from "react-dom";
import { MapControl, withLeaflet } from "react-leaflet";
import { Control, DomUtil, DomEvent } from "leaflet";

// Credit to https://github.com/liveby/react-leaflet-control
// Needed to include this source locally to make some adjustments so that the Gatsby build would work

let DumbControl;
if (typeof window !== 'undefined') {
    DumbControl = Control.extend({
        options: {
            className: "",
            onOff: "",
            handleOff: function noop() {}
        },

        onAdd(/* map */) {
            var _controlDiv = DomUtil.create("div", this.options.className);
            DomEvent.disableClickPropagation(_controlDiv);
            return _controlDiv;
        },

        onRemove(map) {
            if (this.options.onOff) {
            map.off(this.options.onOff, this.options.handleOff, this);
            }

            return this;
        }
    });
}

export default withLeaflet(
  class LeafletControl extends MapControl {
    createLeafletElement(props) {
        if (typeof window !== 'undefined') {
            return new DumbControl(Object.assign({}, props));
        }else{
            return null;
        }
    }

    componentDidMount() {
      super.componentDidMount();

      // This is needed because the control is only attached to the map in
      // MapControl's componentDidMount, so the container is not available
      // until this is called. We need to now force a render so that the
      // portal and children are actually rendered.
      this.forceUpdate();
    }

    render() {
        if (!this.leafletElement || !this.leafletElement.getContainer()) {
            return null;
        }
        return ReactDOM.createPortal(
            this.props.children,
            this.leafletElement.getContainer()
        );
    }
  }
);