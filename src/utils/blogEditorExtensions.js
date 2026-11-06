import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';

export const blogEditorExtensions = [
  StarterKit.configure({ heading: { levels:[1,2,3,4] }, link:{ openOnClick:false, defaultProtocol:'https', HTMLAttributes:{rel:'noopener noreferrer',target:'_blank'} } }),
  TextStyleKit, TextAlign.configure({types:['heading','paragraph']}),
  Image.configure({allowBase64:false}), TableKit.configure({table:{resizable:false}}),
  Placeholder.configure({placeholder:'Write your article here. Select text to format it…'})
];
