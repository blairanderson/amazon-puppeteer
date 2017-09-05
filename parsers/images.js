module.exports = {};
module.exports.parse = function($) {
  const videoEls = $('#imageBlock li.item.videoThumbnail img');
  const imageEls = $('#imageBlock li.item.imageThumbnail img');
  return {
    videos: { count: videoEls.length, thumbnails: [] },
    images: { count: imageEls.length, thumbnails: [] }
  };
};

module.exports.expectation = {
  videos: { count: 1, thumbnails: [] },
  images: { count: 4, thumbnails: [] }
};
