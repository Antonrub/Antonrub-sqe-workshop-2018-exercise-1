import * as esprima from 'esprima';
let chart = [];

function ChartLine(line, type, name, condition, value){
    this.line = line;
    this.type = type;
    this.name = name;
    this.condition = condition;
    this.value = value;
}

const parse_func_decl = (parsed, parsedObject) =>{
    chart.push(new ChartLine(parsedObject.loc.start.line, parsedObject.type, parsedObject.id.name, null, null));
    let param;
    for(param in parsedObject.params){
        chart.push(new ChartLine(parsedObject.params[param].loc.start.line, 'Variable Declaration', parsedObject.params[param].name, null, null));
    }
    parseByFunc['BlockStatement'](parsed, parsedObject.body);
};
const parse_block_statement = (parsed, parsedObject) => {
    let param;
    for(param in parsedObject.body){
        parseByFunc[parsedObject.body[param].type](parsed, parsedObject.body[param]);
    }
};
const parse_variable_declaration = (parsed, parsedObject) => {
    let param;
    for(param in parsedObject.declarations){
        if (parsedObject.declarations[param].init == null)
            chart.push(new ChartLine(parsedObject.declarations[param].loc.start.line, 'Variable Declaration', parsedObject.declarations[param].id.name, null, null));
        else
            chart.push(new ChartLine(parsedObject.declarations[param].loc.start.line, 'Variable Declaration', parsedObject.declarations[param].id.name, null, stringifyExpression[parsedObject.declarations[param].init.type](parsed, parsedObject.declarations[param].init)));
    }
};
const parse_assignment_expression_right_side = (parsed, parsedObject) => {
    if (parsedObject.type == 'BinaryExpression'){
        return binary_exp_to_string(parsed, parsedObject);
    }
    else if(parsedObject.type == 'Literal'){
        return parsedObject.raw;
    }
    return null;
};
const binary_exp_to_string = (parsed, parsedObject) => {
    let result = '';
    result = result + stringifyExpression[parsedObject.left.type](parsed, parsedObject.left);
    result = result + parsedObject.operator;
    result = result + stringifyExpression[parsedObject.right.type](parsed, parsedObject.right);
    return result;
};
const unary_exp_to_string = (parsed, parsedObject) => {
    return parsedObject.operator + stringifyExpression[parsedObject.argument.type](parsed, parsedObject.argument);
};
const parse_expression_statement = (parsed, parsedObject) => {
    parseByFunc[parsedObject.expression.type](parsed, parsedObject.expression);
};
const parse_assignment_expression = (parsed, parsedObject) => {
    chart.push(new ChartLine(parsedObject.loc.start.line, 'Assignment Expression', parsedObject.left.name, null, parseByFunc['AssignmentExpressionRightSide'](parsed, parsedObject.right)));
};
const parse_while_statement = (parsed, parsedObject) => {
    chart.push(new ChartLine(parsedObject.loc.start.line, 'While Statement', null, stringifyExpression[parsedObject.test.type](parsed, parsedObject.test), null));
    let param;
    for (param in parsedObject.body.body){
        parseByFunc[parsedObject.body.body[param].type](parsed, parsedObject.body.body[param]);
    }
};
const member_exp_to_string = (parsed, parsedObject) => {
    return '' + parsedObject.object.name + '[' + stringifyExpression[parsedObject.property.type](parsed, parsedObject.property) + ']';
};
const parse_if_statement = (parsed, parsedObject) => {
    chart.push(new ChartLine(parsedObject.loc.start.line, 'If Statement', null, stringifyExpression[parsedObject.test.type](parsed, parsedObject.test), null));
    parseByFunc[parsedObject.consequent.type](parsed, parsedObject.consequent);
    if (parsedObject.alternate != null) {
        parseByFunc[parsedObject.alternate.type](parsed, parsedObject.alternate);
    }
};
const parse_return_statement = (parsed, parsedObject) => {
    chart.push(new ChartLine(parsedObject.loc.start.line, 'Return Statement', null, null, stringifyExpression[parsedObject.argument.type](parsed, parsedObject.argument)));
};
const parse_for_statement = (parsed, parsedObject) => {
    let res = '';
    if(parsedObject.init != null){
        res = res + parsed.substring(parsedObject.init.range[0], parsedObject.init.range[1] - 1);
    }
    res = res + ';' + parsed.substring(parsedObject.test.range[0], parsedObject.test.range[1]) + ';' + parsed.substring(parsedObject.update.range[0], parsedObject.update.range[1]);
    chart.push(new ChartLine(parsedObject.loc.start.line, 'For Statement', null, res, null));
    parse_block_statement(parsed, parsedObject.body);
};
const parse_forin_statement = (parsed, parsedObject) => {
    let res = '' + parsed.substring(parsedObject.left.range[0], parsedObject.left.range[1]) + ' in ' + parsed.substring(parsedObject.right.range[0], parsedObject.right.range[1]);
    chart.push(new ChartLine(parsedObject.loc.start.line, 'ForIn Statement', null, res, null));
    parse_block_statement(parsed, parsedObject.body);
};
const stringify_binary_expression = (parsed, parsedObject) => {
    return binary_exp_to_string(parsed, parsedObject);
};
const stringify_literal_expression = (parsed, parsedObject) => {
    return parsedObject.raw;
};
const stringify_identifier_expression = (parsed, parsedObject) => {
    return parsedObject.name;
};
const stringify_member_expression = (parsed, parsedObject) => {
    return member_exp_to_string(parsed, parsedObject);
};
const stringify_unary_expression = (parsed, parsedObject) => {
    return unary_exp_to_string(parsed, parsedObject);
};
const parseByFunc = {
    'FunctionDeclaration' : parse_func_decl,
    'BlockStatement' : parse_block_statement,
    'VariableDeclaration' : parse_variable_declaration,
    'ExpressionStatement' : parse_expression_statement,
    'AssignmentExpression' : parse_assignment_expression,
    'AssignmentExpressionRightSide' : parse_assignment_expression_right_side,
    'WhileStatement' : parse_while_statement,
    'IfStatement' : parse_if_statement,
    'ReturnStatement' : parse_return_statement,
    'ForStatement' : parse_for_statement,
    'ForInStatement' : parse_forin_statement
};
const stringifyExpression = {
    'BinaryExpression' : stringify_binary_expression,
    'Literal' : stringify_literal_expression,
    'Identifier' : stringify_identifier_expression,
    'MemberExpression' : stringify_member_expression,
    'UnaryExpression' : stringify_unary_expression};
const parseCode = (codeToParse) => {
    chart = [];
    let parsed = JSON.stringify(esprima.parseScript(codeToParse, {loc:true, range:true}));
    if (JSON.parse(parsed).body[0] != null) {
        parseByFunc[JSON.parse(parsed).body[0].type](codeToParse, JSON.parse(parsed).body[0]);
    }
    return chart;
};

export {parseCode};
