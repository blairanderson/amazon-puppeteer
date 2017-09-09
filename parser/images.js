module.exports = {};
module.exports.parse = function($) {
  const videoEls = $('#imageBlock li.item.videoThumbnail img');
  const imageEls = $('#imageBlock li.item.imageThumbnail img');
  return {
    images: { count: imageEls.length, thumbnails: [] },
    videos: { count: videoEls.length, thumbnails: [] }
  };
};

module.exports.expectation = {
  images: { count: 4, thumbnails: [] },
  videos: { count: 1, thumbnails: [] }
};
