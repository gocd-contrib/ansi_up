import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const GLOBAL_BUILD = readFileSync(new URL('../dist/ansi_up.global.js', import.meta.url), 'utf8');
const SAMPLE = "\x1B[31mred\x1B[0m";
const EXPECTED = '<span style="color:rgb(187,0,0)">red</span>';

describe('ansi_up plain-script build (dist/ansi_up.global.js)', function () {

  it('defines a global AnsiUp when run as a plain script', function () {
    const ctx = vm.createContext({});
    vm.runInContext(GLOBAL_BUILD, ctx);
    (typeof ctx.AnsiUp).should.eql('function');
    new ctx.AnsiUp().ansi_to_html(SAMPLE).should.eql(EXPECTED);
  });

  it('still defines the global when an AMD loader or CommonJS exports are in scope', function () {
    const define = () => { throw new Error('should not register with AMD'); };
    define.amd = {};
    const ctx = vm.createContext({ define, exports: {}, module: { exports: {} } });
    vm.runInContext(GLOBAL_BUILD, ctx);
    (typeof ctx.AnsiUp).should.eql('function');
  });

  it('defines the global when concatenated into a larger script', function () {
    const src = 'var before = 1;\n' + GLOBAL_BUILD + '\nvar after = typeof AnsiUp;\n';
    const ctx = vm.createContext({});
    vm.runInContext(src, ctx);
    ctx.after.should.eql('function');
  });

  it('can be extended with class ... extends AnsiUp', function () {
    const src = GLOBAL_BUILD + `
      class Shouty extends AnsiUp {
        ansi_to_html(txt) { return super.ansi_to_html(txt).toUpperCase(); }
      }
      var result = new Shouty().ansi_to_html(${JSON.stringify(SAMPLE)});
    `;
    const ctx = vm.createContext({});
    vm.runInContext(src, ctx);
    ctx.result.should.eql(EXPECTED.toUpperCase());
  });

  it('matches the behaviour of the ES module build', async function () {
    const { AnsiUp } = await import('../dist/ansi_up.js');
    const ctx = vm.createContext({});
    vm.runInContext(GLOBAL_BUILD, ctx);
    const input = "\x1B[1;38;5;171mfoo\x1B[0m \x1B[38;2;10;20;30mbar\x1B[0m \x1B]8;;http://example.com\x1B\\link\x1B]8;;\x1B\\";
    new ctx.AnsiUp().ansi_to_html(input).should.eql(new AnsiUp().ansi_to_html(input));
  });
});
