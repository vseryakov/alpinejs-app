#!/bin/sh

echo > bundle.js

for file in "$@"; do
    case $file in
    -minify)
      minify=1
      ;;
    *.js)
      cat $file >> bundle.js
      ;;

    *.html)
      n=$(basename $file .html)
      echo "app.templates[\"$n\"]='$(cat $file|tr -d '\r\n'|sed "s/['\\]/\\\&/g")';" >> bundle.js
      ;;
  esac
done

[ -n "$minify" ] && esbuild --minify bundle.js > bundle.min.js


                        