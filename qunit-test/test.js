/* -- COPY-ABLE TEST CASE --------------------------

test("JSL.text()", function () {
    expect(1);
    strictEqual( 1, 1, 'foo');
});

---------------------------------------------- */



/* -- SHORTCUTS FOR COPY-PASTE ------------------

id('qunit-fixture')
id('test-p')

---------------------------------------------- */



test("JSL init", function () {
    expect(6);

    equal( JSL().length, 0, "JSL() length equal to zero" );
    equal( JSL(undefined).length, 0, "JSL(undefined) === JSL([])" );
    equal( JSL(null).length, 0, "JSL(null) === JSL([])" );
    equal( JSL("").length, 0, "JSL('') === JSL([])" );
    equal( JSL("#").length, 0, "JSL('#') === JSL([])" );
    equal( JSL(window).length, 1, 'Correct number of elements generated for JSL(window)' );
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL context", function () {
    expect(3);

    strictEqual( JSL('div p', '#qunit-fixture')[0], id('test-p'), 'Selector with string as context' );
    strictEqual( JSL('div p', id('qunit-fixture'))[0], id('test-p'), 'Selector with element as context' );
    strictEqual( JSL('div p', JSL('#qunit-fixture'))[0], id('test-p'), 'Selector with JSL object as context' );
});

// ----------------------------------------------------------------------------------------------------------------------

test("length", function () {
    expect(1);

    equal( JSL('#qunit-fixture div').length, 3, 'Returning the correct # of elements found');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).has()", function () {
    expect(1);

    equal( JSL('#test-p-container').has('p').length, 1, 'Returning the correct number of elements');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).is()", function () {
    expect(1);

    equal( JSL('#test-p-container').is('div'), true, 'Returning the correct value');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).prop()", function () {
    expect(1);

    equal( JSL('#some-checkbox').prop('checked'), false, 'Getting checked property');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).text()", function () {
    var testp = id('test-p');

    expect(2);

    JSL('#test-p').text('foobar');
    strictEqual( testp.textContent, 'foobar', 'Setting element text');

    testp.textContent = 'foo';
    JSL('#test-p').text('bar', true);
    strictEqual( testp.textContent, 'foobar', 'Appending element text');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).value()", function () {
    expect(2);

    equal( JSL('#select').value(), 'two', 'Getting correct select dropdown value');
    equal( JSL('#textbox').value(), 'foo', 'Getting correct text field value');
});

// ----------------------------------------------------------------------------------------------------------------------

test("JSL(...).width + JSL(...).height", function () {
    expect(2);

    strictEqual( JSL('#w400px').width, id('w400px').offsetWidth, 'JSL(...).width proper value & type (number)');
    strictEqual( JSL('#h400px').height, id('h400px').offsetHeight, 'JSL(...).height proper value & type (number)');
});