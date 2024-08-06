# make it executable with chmod +x compress_pngs.fish, and then run it with ./compress_pngs.fish. This should work properly in the Fish shell and provide feedback on the processing of each PNG file.


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
