
SOURCE   = *.ts
TESTS    = test/*.js
REPORTER = dot

typescript: esm global

esm:
		./node_modules/.bin/tsc -p .

# A plain-script build that defines a global `AnsiUp`, for consumers that cannot
# use ES modules, e.g. when concatenating directly into a plain JS bundle.
global:
		./node_modules/.bin/tsc -p tsconfig.global.json
		cat ./global.header ./build/global/ansi_up.js ./global.footer > dist/ansi_up.global.js
		rm -rf ./build

test:
		@NODE_ENV=test ./node_modules/.bin/mocha \
				--require should \
				--reporter $(REPORTER) \
				$(TESTS)

test_verbose:
		@NODE_ENV=test ./node_modules/.bin/mocha \
				--require should \
				--reporter spec \
				$(TESTS)

clean:
		rm -rf ./node_modules ./build ./dist

.PHONY:	test typescript esm global clean
