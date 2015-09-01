# dm-tmux

## Description
* a command line tmux helper writte in nodejs
* i started this, because i often had the feeling, that i want to copy the current layout and create a new one out of it

## Shortcut
```
dmt [yml]
```

## Install

```
npm install dm-tmux -g
```

## Tasks


### dmt yml [directory [fileName]]
* creates a tmuxinator yml-file which copies the current tmuxinator layout. getting the layout from tmux list-windows.
* examples
```
dmt yml
dmt yml ~/.tmuxinator test // creates ~/.tmuxinator/test.yml with current layout
```

## Config
* you can place a .dm-tmux.json file in your home directory (~/.dm-tmux.json)
* the following things are allowed at the moment
```javascript
{
    "ymlFilePath": "~/.tmuxinator"
}
```
* ymlFilePath: says where the yml-file should be placed

## Lessons Learned
