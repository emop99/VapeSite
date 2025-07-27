import {mergeAttributes, Node} from '@tiptap/core';

export const Video = Node.create({
  name: 'video',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {
        class: 'rounded-lg max-w-full my-4',
        controls: true,
        controlsList: 'nodownload',
        preload: 'metadata',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({HTMLAttributes}) {
    // 파일 확장자에 따라 MIME 타입 결정
    let mimeType = 'video/mp4'; // 기본값

    if (HTMLAttributes.src) {
      const extension = HTMLAttributes.src.split('.').pop().toLowerCase();

      // 확장자별 MIME 타입 매핑
      const mimeTypes = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'mkv': 'video/x-matroska'
      };

      if (mimeTypes[extension]) {
        mimeType = mimeTypes[extension];
      }
    }

    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ['source', {src: HTMLAttributes.src, type: mimeType}],
    ];
  },

  addCommands() {
    return {
      setVideo: (options) => ({commands}) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

export default Video;