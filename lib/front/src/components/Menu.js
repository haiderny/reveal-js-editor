import {remote} from 'electron';

import React from 'react';
import {connect} from 'react-redux';

import {openFile, saveProject, saveMd, saveHtml, showInFolder, openInEditor} from '../actions/fileActions';
import {copyHtmlToClipboard, insert, insertImage, setBgOptions} from '../actions/actions';
import {getLabel, getCurrentFileName} from '../selectors';

const mapStateToProps = (state) => ({
    label: getLabel(state),
    currentFileName: getCurrentFileName(state)
});

const mapDispatchToProps = dispatch => ({
    openFile: () => dispatch(openFile()),
    saveProject: () => dispatch(saveProject()),
    saveMd: () => dispatch(saveMd()),
    saveHtml: () => dispatch(saveHtml()),
    copyHtmlToClipboard: () => dispatch(copyHtmlToClipboard()),
    showInFolder: () => dispatch(showInFolder()),
    openInEditor: () => dispatch(openInEditor()),
    insert: (text, pattern) => dispatch(insert(text, pattern)),
    insertImage: () => dispatch(insertImage()),
    setBgOptions: () => dispatch(setBgOptions())
});



class Menu extends React.Component {

    getTemplate() {
        const transitions = ['None', 'Slide',  'Fade', 'Convex', 'Concave', 'Zoom'];

        const slideTransitionMenuItem = transitions.slice(1).map(transitionName => ({
            label: this.props.label(transitionName),
            click: () => this.props.insert(`transition="${transitionName.toLowerCase()}"', 'transition="[^"]+"`)
        }));

        const insertMenuItems = [{
            label: this.props.label('Presentation slide'),
            accelerator: 'CommandOrControl+Shift+S',
            click: () => {this.props.insert('::::slide\n\n::::');}
        }, {
            label: this.props.label('Nested slide'),
            accelerator: 'CommandOrControl+Shift+N',
            click: () => {this.props.insert(':::slide\n\n:::');}
        }, {
            type: 'separator'
        }, {
            label: this.props.label('Image'),
            accelerator: 'CommandOrControl+Shift+I',
            click: () => {this.props.insertImage();}
        }, {
            type: 'separator'
        }, {
            label: this.props.label('Fragment fade in'),
            accelerator: 'CommandOrControl+Shift+F',
            click: () => {
                this.props.insert('{fragment}', '{fragment[^}]*}');
            }
        }];

        ['Fragment grow',
         'Fragment shrink',
         'Fragment fade-out',
         'Fragment fade-up',
         'Fragment current-visible',
         'Fragment highlight-current-blue',
         'Fragment highlight-red',
         'Fragment highlight-green',
         'Fragment highlight-blue'
        ].forEach(fragmentName => {
            insertMenuItems.push(
                {
                    label: this.props.label(fragmentName),
                    click: () => {
                        this.props.insert(`{${fragmentName.toLowerCase()}}`, '{fragment[^}]*}');
                    }
                }
            )
        });

        insertMenuItems.push({
            type: 'separator'
        }, {
            label: this.props.label('Individual slide transition'),
            submenu: slideTransitionMenuItem
        }, {
            type: 'separator'
        }, {
            label: this.props.label('Slide class'),
            click: () => this.props.insert('class=""', 'class="[^"]*"')
        }, {
            label: this.props.label('Slide id'),
            click: () => this.props.insert('id=""', 'id="[^"]*"')
        }, {
            label: this.props.label('Slide background...'),
            accelerator: 'CommandOrControl+Shift+B',
            click: this.props.setBgOptions
        });

        return [{
        label: this.props.label('File'),
        submenu: [{
            label: this.props.label('Open a markdown file...'),
            accelerator: 'CmdOrCtrl+O',
            click: this.props.openFile
        }, {
            label: this.props.label('Save presentation...'),
            accelerator: 'CmdOrCtrl+S',
            click: this.props.saveProject
        }, {
            label: this.props.label('Save markdown only...'),
            click: this.props.saveMd
        }, {
            label: this.props.label('Save HTML only...'),
            click: this.props.saveHtml
        }, {
            label: this.props.label('Copy HTML to clipboard'),
            click: this.props.copyHtmlToClipboard
        }, {
            label: this.props.label('Show in file system'),
            enabled: Boolean(this.props.currentFileName.length),
            click: this.props.showInFolder
        }, {
            label: this.props.label('Open in default editor'),
            enabled: Boolean(this.props.currentFileName.length),
            click: this.props.openInEditor

        }]
    }, {
        label:  this.props.label('Edit'),
        submenu: [{
            label:  this.props.label('Undo'),
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            label:  this.props.label('Redo'),
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label:  this.props.label('Find'),
            accelerator: 'CmdOrCtrl+F',
            role: 'find'
        }, {
            label:  this.props.label('Replace'),
            accelerator: 'CmdOrCtrl+R',
            role: 'replace'
        }, {
            type: 'separator'
        }, {
            label:  this.props.label('Cut'),
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label:  this.props.label('Copy'),
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label:  this.props.label('Paste'),
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label:  this.props.label('Select All'),
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }]
    }, {
        label: this.props.label('Insert'),
        submenu: insertMenuItems
    }, {
            label: 'Developer',
            submenu: [{
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'F12',
                click() {
                    remote.getCurrentWindow()
                        .webContents.toggleDevTools()
                }
            }]
        }];
    }

    buildMenu() {
        const menu = remote.Menu.buildFromTemplate(this.getTemplate());
        remote.Menu.setApplicationMenu(menu);
    }

    constructor(props) {
        super(props);

        this.buildMenu();
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.currentFileName !== this.props.currentFileName
    }

    componentDidUpdate() {
        this.buildMenu();
    }


    render() {
        return null;
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);