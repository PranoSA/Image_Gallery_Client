"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ImageGallery = function () {
    var _a = react_1.useState([]), images = _a[0], setImages = _a[1];
    //hours is 0..23
    var hours = new Date().getHours();
    react_1.useEffect(function () {
        fetch('/api/images')
            .then(function (res) { return res.json(); })
            .then(function (data) { return setImages(data); });
    }, []);
    //render hour by hour scrollable with times on the side
    return (React.createElement("div", null, images.map(function (image) { return (React.createElement("img", { src: image, key: image })); })));
};
