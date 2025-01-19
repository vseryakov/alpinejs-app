#!/bin/sh

echo > bundle.js

for file in "$@"; do
    case $file in
    *.js)
      cat $file >> bundle.js
      ;;

    *.html)
      n=$(basename $file .html)
      echo "app.templates[\"$n\"]='$(cat $file|tr -d '\r\n'|sed "s/['\\]/\\\&/g")';" >> bundle.js
      ;;
  esac
done

                        