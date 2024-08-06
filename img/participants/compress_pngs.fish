#!/usr/bin/env fish
mkdir -p small
for i in *.png
  echo "Processing $i"
  pngquant "$i" --output "small/$i" --strip
  if test $status -eq 0
    echo "$i processed successfully"
  else
    echo "Error processing $i"
  end
end
