/* copy-able test case
test("JSL.text()", function () {
    expect(1);
    strictEqual( 1, 1, 'foo');
});
*/

var fixture = document.getElementById('qunit-fixture');

test("JSL init", function () {
    expect(6);
    equal( JSL().length, 0, "JSL() === JSL([])" );
    equal( JSL(undefined).length, 0, "JSL(undefined) === JSL([])" );
    equal( JSL(null).length, 0, "JSL(null) === JSL([])" );
    equal( JSL("").length, 0, "JSL('') === JSL([])" );
    equal( JSL("#").length, 0, "JSL('#') === JSL([])" );
    equal( JSL(window).length, 1, 'Correct number of elements generated for JSL(window)' );
});

test("JSL context", function () {
    expect(3);
    strictEqual( JSL('div p', '#qunit-fixture')[0], id('test-p'), 'Selector with string as context' );
    strictEqual( JSL('div p', id('qunit-fixture'))[0], id('test-p'), 'Selector with element as context' );
    strictEqual( JSL('div p', JSL('#qunit-fixture'))[0], id('test-p'), 'Selector with JSL object as context' );
});

test("JSL.text()", function () {
    expect(1);
    JSL('#test-p').text('testing text');
    strictEqual( JSL('#test-p').text(), 'testing text', 'JSL setting element text');
});

test("JSL.prop()", function () {
    expect(1);
    equal( JSL('#some-checkbox').prop('checked'), false, 'JSL getting checked property');
});