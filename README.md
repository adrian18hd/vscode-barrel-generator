# vscode-barrel-generator

## Features

It facilitates the generation of `index.ts` barrel files. 

This is achieved by automatically updating the current `index.ts` file. The update includes incorporating all files and folders found within the directory that houses the currently open file in the editor window.

If one of the sub-folders contains an `index.ts` file, all the files in that folder will be excluded.

## Release Notes

### 1.0.0
- Initial release
