// File type detection helper
export const detectFileType = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type;

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico'].includes(ext)) {
    return 'image';
  }
  
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg'].includes(ext)) {
    return 'audio';
  }
  
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv'].includes(ext)) {
    return 'video';
  }
  
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'html'].includes(ext)) {
    return 'document';
  }
  
  return 'unknown';
};

// Get conversion options based on file type
export const getConversionOptions = (fileType, currentFiles = []) => {
  const options = {
    image: [
      { value: 'jpg', label: 'JPG', icon: '🖼️' },
      { value: 'png', label: 'PNG', icon: '🖼️' },
      { value: 'webp', label: 'WebP', icon: '🖼️' },
      { value: 'gif', label: 'GIF', icon: '🖼️' },
      { value: 'bmp', label: 'BMP', icon: '🖼️' },
      { value: 'tiff', label: 'TIFF', icon: '🖼️' },
      { value: 'ico', label: 'ICO', icon: '🖼️' },
    ],
    audio: [
      { value: 'mp3', label: 'MP3', icon: '🎵' },
      { value: 'wav', label: 'WAV', icon: '🎵' },
      { value: 'flac', label: 'FLAC', icon: '🎵' },
      { value: 'aac', label: 'AAC', icon: '🎵' },
      { value: 'ogg', label: 'OGG', icon: '🎵' },
      { value: 'm4a', label: 'M4A', icon: '🎵' },
    ],
    video: [
      { value: 'mp4', label: 'MP4', icon: '🎬' },
      { value: 'webm', label: 'WebM', icon: '🎬' },
      { value: 'avi', label: 'AVI', icon: '🎬' },
      { value: 'mov', label: 'MOV', icon: '🎬' },
      { value: 'mkv', label: 'MKV', icon: '🎬' },
      { value: 'flv', label: 'FLV', icon: '🎬' },
    ],
    document: [
      { value: 'pdf', label: 'PDF', icon: '📄' },
      { value: 'docx', label: 'DOCX', icon: '📄' },
      { value: 'txt', label: 'TXT', icon: '📄' },
      { value: 'rtf', label: 'RTF', icon: '📄' },
      { value: 'html', label: 'HTML', icon: '📄' },
    ],
  };
  
  let availableOptions = options[fileType] || [];
  
  // Filter out the source format(s) from the conversion options
  if (currentFiles.length > 0) {
    const sourceFormats = new Set(
      currentFiles.map(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        // Normalize extensions
        if (ext === 'jpeg') return 'jpg';
        if (ext === 'doc') return 'docx';
        if (ext === 'tif') return 'tiff';
        return ext;
      })
    );
    
    availableOptions = availableOptions.filter(
      option => !sourceFormats.has(option.value)
    );
  }
  
  return availableOptions;
};
