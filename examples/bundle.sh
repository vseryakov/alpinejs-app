#!/bin/sh

bundle=bundle.js
echo > $bundle

for file in "$@"; do
    case $file in
    -minify)
      minify=1
      ;;
    *.js)
      cat $file >> $bundle
      ;;

    *.html)
      n=$(basename $file .html)
      echo "app.templates[\"$n\"]='$(cat $file|tr -d '\r\n'|sed "s/['\\]/\\\&/g")';" >> $bundle
      ;;
  esac
done

                        
