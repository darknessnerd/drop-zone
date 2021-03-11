import { noPropagation, uuidv4 } from '@/utils';

export default function useDragAndDrop({
  itemManager,
}) {
  // TODO - Make config
  const ignoreHiddenFiles = false;

  const handleDragOver = ($event) => {
    let effect;
    try {
      effect = $event.dataTransfer.effectAllowed;
    } catch (error) {
      // Do nothing due to ie bg
    }
    noPropagation($event);
    // eslint-disable-next-line no-param-reassign
    $event.dataTransfer.dropEffect = effect === 'move' || effect === 'linkMove' ? 'move' : 'copy';
  };
  // Goes through the directory, and adds each file it finds recursively
  const addFilesFromDirectory = (directory, path, result) => {
    /*
      Returns an array containing some number of the directory's entries.
      Each item in the array is an object based on FileSystemEntry—typically
      either FileSystemFileEntry or FileSystemDirectoryEntry.
     */
    const dirReader = directory.createReader();
    const errorHandler = (error) => { console.log(error); };
    const readEntries = () => dirReader.readEntries((entries) => {
      if (entries.length > 0) {
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          if (entry.isFile) {
            entry.file((file) => {
              if (
                ignoreHiddenFiles
                  && file.name.substring(0, 1) === '.'
              ) {
                return;
              }
              console.warn(entry);
              // eslint-disable-next-line no-param-reassign
              file.fullPath = `${path}/${file.name}`;
              itemManager.addFile(uuidv4(), file);
            });
          } else if (entry.isDirectory) {
            addFilesFromDirectory(entry, `${path}/${entry.name}`, result);
          }
        }
        // Recursively call readEntries() again, since browser only handle
        // the first 100 entries.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/DirectoryReader#readEntries
        readEntries();
      }
      return null;
    }, errorHandler);
    return readEntries();
  };
  // When a folder is dropped (or files are pasted), items must be handled
  // instead of files.
  const addFilesFromItems = (dataTransferItems, includeFirstLvl) => {
    console.warn(dataTransferItems);
    dataTransferItems.forEach((dataTransferItem) => {
      let entry = null;
      console.warn(dataTransferItem);
      if (dataTransferItem.webkitGetAsEntry != null) {
        entry = dataTransferItem.webkitGetAsEntry();
        if (entry.isFile && includeFirstLvl) {
          itemManager.addFile(uuidv4(), dataTransferItem.getAsFile());
        } else if (entry.isDirectory) {
          addFilesFromDirectory(entry, entry.name);
        } else {
          console.warn('addFilesFromItems.webkitGetAsEntry: unknown entry');
        }
      } else if (dataTransferItem.getAsFile != null) {
        if (dataTransferItem.kind == null || dataTransferItem.kind === 'file') {
          itemManager.addFile(uuidv4(), dataTransferItem.getAsFile());
        } else {
          console.warn('dataTransferItem.getAsFile: unknown entry');
        }
      }
    });
  };
  const onDrop = ($event) => {
    noPropagation($event);

    if ($event.dataTransfer.items) {
      const dataTransferItems = $event.dataTransfer.items;
      if (dataTransferItems
          && dataTransferItems.length
          && dataTransferItems[0].webkitGetAsEntry != null) {
        addFilesFromItems(dataTransferItems, true);
      }
    } else {
      for (let i = 0; i < $event.dataTransfer.files.length; i += 1) {
        const itemId = uuidv4();
        const file = $event.dataTransfer.files[i];
        itemManager.addFile(itemId, file);
      }
    }
  };
  return {
    handleDragOver,
    onDrop,
  };
}
