#!/bin/bash
die () {
	echo "Execution interrupted!"
    exit 1
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TMP_DIR=$(mktemp -d)

if [[ ! "$TMP_DIR" || ! -d "$TMP_DIR" ]]; then
  echo "Could not create temp dir!"
  die
fi

function cleanup {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

while getopts t: flag
do
    case "${flag}" in
        t) version=${OPTARG};;
    esac
done
echo "Version: $version";

cd ${SCRIPT_DIR}
if [ $(git tag -l "$version") ]; then
    echo "Tag detected"
    ${SCRIPT_DIR}/doc_and_minify.sh || die

    ver_path="${SCRIPT_DIR}/build/"
	namespace_var="simonlitt"
	mkdir -p ${ver_path} || die

    build_files="$TMP_DIR/${namespace_var}/jquery-consistent-listbox/"
    mkdir -p ${build_files} || die

    zip_file_name="${ver_path}jquery-consistent-listbox-$version.zip"
    rm -f "${zip_file_name}"

    declare -A publish_file_list
	publish_file_list['LICENSE']='LICENSE'
	publish_file_list['listbox.min.css']='upload/listbox.min.css'
	publish_file_list['listbox.min.js']='upload/listbox.min.js'

	echo "Extracting '${version}' files..."
    for file_name in "${!publish_file_list[@]}"; do
		file_tag_path=${publish_file_list["$file_name"]}
		echo "  extract: $file_name..."
		git show "${version}:$file_tag_path" >> "${build_files}${file_name}" || die
	done

	echo "Archiving..."
	cd $TMP_DIR
	zip -r $zip_file_name "$namespace_var/" || die
	cd - > /dev/null
	echo "Successfully completed!"
else
    echo "Tag '${version}' not found!"
    echo "Usage: build.sh -t TAG_NAME"
fi
cd - > /dev/null
