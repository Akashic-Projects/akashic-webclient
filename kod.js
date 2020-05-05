// This codepen uses a custom Ace build to achieve marker popovers
// PR details here: https://github.com/ajaxorg/ace/pull/3143

const editor = ace.edit("editor");
const Range = ace.require("ace/range").Range;

// React Components ------------------------------------
let { Overlay, Popover } = ReactBootstrap; // Lookup 'es6 destructuring assignment' if this line confuses you
class MarkerPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  render() {
    return (
      <Overlay
        ref={(overlay) => (this.overlay = overlay)}
        target={() => this.props.overlayTarget}
        container={$("#editor")[0]}
        placement={this.props.overlayPlacement}
        rootClose={true}
        onHide={() => this.setState({ show: false })}
        show={this.state.show}
      >
        {this.props.children}
      </Overlay>
    );
  }
}

// Helper Methods ------------------------------------
// Returns a string array containing the HTML making up an Ace marker
function getMarkerHTML(html, markerLayer, session, config, range, markerClass) {
  let stringBuilder = [];
  if (range.isMultiLine()) {
    // drawTextMarker is defined by ace's marker layer
    markerLayer.drawTextMarker(stringBuilder, range, markerClass, config);
  } else {
    // drawSingleLineMarker is defined by ace's marker layer
    markerLayer.drawSingleLineMarker(
      stringBuilder,
      range,
      `${markerClass} ace_start ace_br15`,
      config
    );
  }

  return stringBuilder;
}
// Defines a generic dynamicMarker update that renders a bootstrap popover on mouseenter
function customUpdateWithOverlay(
  markerClass,
  markerRange,
  overlayPlacement,
  overlayTitle,
  overlayContent,
  overrideWidth
) {
  return (html, markerLayer, session, config) => {
    // Use the helper method above to get the marker's HTML as a string (how Ace normally does it)
    let markerHTML = getMarkerHTML(
      html,
      markerLayer,
      session,
      config,
      markerRange,
      markerClass
    );
    // Use jQuery to parse that HTML into an actual DOM element
    let markerElement = $.parseHTML(markerHTML.join(""))[0];
    // From here, we can manipulate the DOM element however we so choose
    // In this case, we use it as a root for ReactDOM and use
    // react-bootstrap components to render a popover
    ReactDOM.render(
      <MarkerPopup
        ref={(popup) => (this.popup = popup)}
        overlayTarget={markerElement}
        overlayPlacement={overlayPlacement}
      >
        <Popover
          placement={overlayPlacement}
          title={overlayTitle}
          style={overrideWidth ? { maxWidth: "100%" } : {}}
        >
          {overlayContent}
        </Popover>
      </MarkerPopup>,
      markerElement
    );
    $(markerElement).css("pointer-events", "auto");
    // Since we have the actual DOM element, we can bind event handlers to it
    $(markerElement).mouseenter(() => {
      this.popup.setState({ show: true });
    });

    // Finally we append the element to the marker layer's DOM as a child
    // Since the marker layer is now using insertAdjacentHTML with this
    // custom build, the child is retained
    markerLayer.element.appendChild(markerElement);
  };
}

// Pick random words and get their ranges -------------
const word1 = getRandomWord();

// Dynamic Markers ------------------------------------
let highlight1 = {};
highlight1.update = customUpdateWithOverlay.call(
  highlight1,
  "marker1",
  word1.range,
  "bottom",
  "Lorem Ipsum Popover",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque venenatis velit tellus.",
  false
);

// Finally, add the markers to the editor
const marker1 = editor.session.addDynamicMarker(highlight1);
