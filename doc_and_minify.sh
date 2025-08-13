#!/bin/bash
die () {
    exit 1
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Generation of documentation..."
jsdoc "${SCRIPT_DIR}/listbox.js" -d "${SCRIPT_DIR}/docs/" || die

echo "Minimization..."
uglifyjs "${SCRIPT_DIR}/listbox.js" -o "${SCRIPT_DIR}/upload/listbox.min.js" --compress --mangle --comments || die
uglifycss "${SCRIPT_DIR}/listbox.css" > "${SCRIPT_DIR}/upload/listbox.min.css" || die
