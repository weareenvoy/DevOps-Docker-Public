set -eo pipefail
IFS=$'\n\t'

tsc --build ./tsconfig.build.json
mkdir -p ./lib/public
mkdir -p ./lib/vendor
cp -Rf ./src/public/** ./lib/public
cp -Rf ./src/vendor/** ./lib/vendor
