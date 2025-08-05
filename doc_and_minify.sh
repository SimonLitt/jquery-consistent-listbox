#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

jsdoc "${SCRIPT_DIR}/listbox.js" -d "${SCRIPT_DIR}/docs/"

uglifyjs "${SCRIPT_DIR}/listbox.js" -o "${SCRIPT_DIR}/upload/listbox.min.js" --compress --mangle
uglifycss "${SCRIPT_DIR}/listbox.css" > "${SCRIPT_DIR}/upload/listbox.min.css"
