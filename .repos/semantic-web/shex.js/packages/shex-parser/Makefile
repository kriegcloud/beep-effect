JISON?=./node_modules/jison/lib/cli.js

./lib/ShExJison.js: ./lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lr

./lib/ShapeMapJison.js: ./lib/ShapeMapJison.jison
	$(JISON) $^ -o $@ -p lalr

build: ./lib/ShExJison.js ./lib/ShapeMapJison.js

test: build
	(cd test && make test)

publish-npm: ./lib/ShExJison.js ./lib/ShapeMapJison.js
	npm publish

earl: ./bin/_genEARL.js
	$^ > doc/earl.ttl

