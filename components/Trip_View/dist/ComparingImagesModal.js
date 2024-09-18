"use strict";
exports.__esModule = true;
var hi_1 = require("react-icons/hi");
var image_1 = require("next/image");
function ComparingImagesModal(_a) {
    var imagesForDay = _a.imagesForDay, handleComparePhotosSelection = _a.handleComparePhotosSelection, setComparingPhotos = _a.setComparingPhotos, setDoneSelectedImages = _a.setDoneSelectedImages, selectedImages = _a.selectedImages;
    return (React.createElement("div", { className: "" },
        React.createElement("div", { className: "gallery mt-4" }, imagesForDay.map(function (image) { return (React.createElement("div", { key: image.id },
            React.createElement(hi_1.HiOutlinePencil, null),
            React.createElement(image_1["default"], { src: process.env.NEXT_PUBLIC_STATIC_IMAGE_URL + "/" + image.file_path, alt: "Image for " + image.created_at, width: 100, height: 100, onClick: function () {
                    handleComparePhotosSelection(image);
                }, style: {
                    cursor: 'pointer',
                    margin: '10px',
                    width: '100px',
                    height: '100px',
                    border: selectedImages.includes(image)
                        ? '5px solid blue'
                        : 'none'
                } }))); })),
        React.createElement("div", { className: "flex justify-center items-center" },
            React.createElement("button", { onClick: function () { return setComparingPhotos(false); } }, "Cancel")),
        React.createElement("div", { className: "flex justify-center items-center" },
            React.createElement("button", { onClick: function () { return setDoneSelectedImages(true); } }, "Finish Selecting Images"))));
}
exports["default"] = ComparingImagesModal;
