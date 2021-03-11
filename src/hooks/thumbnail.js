const thumbnailQueue = [];
let isProcessing = false;
export default function useThumbnail(done) {
  const generateThumbnail = (item) => {
    const reader = new FileReader();
    /*
        Add an event listener for when the file has been loaded
        to update the src on the file preview.
      */
    reader.addEventListener('load', () => {
      done(item.id, reader.result);
    }, false);
    /*
        Read the data for the file in through the reader. When it has
        been loaded, we listen to the event propagated and set the image
        src to what was loaded from the reader.
      */
    reader.readAsDataURL(item.file);
  };
  const shiftQueue = () => {
    if (isProcessing || thumbnailQueue.length === 0) {
      return;
    }
    isProcessing = true;
    const item = thumbnailQueue.shift();
    generateThumbnail(item);
    isProcessing = false;
  };
  const enqueueThumbnail = (id, file) => {
    // Check if it's an image
    if (/\.(jpe?g|png|gif)$/i.test(file.name) || file.type.match('image.*')) {
      thumbnailQueue.push({ id, file });
      setTimeout(() => shiftQueue(), 0);
    }
  };
  return { enqueueThumbnail };
}
