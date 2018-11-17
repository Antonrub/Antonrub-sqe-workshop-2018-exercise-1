import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let columns = ['line', 'type', 'name', 'condition', 'value'];
        let chart = document.getElementById('chart');
        chart.innerHTML = '';
        let table_row = chart.insertRow(-1);
        for (let i = 0; i < columns.length; i++) {  //create header row
            let th = document.createElement('th');
            th.innerHTML = columns[i];
            table_row.appendChild(th);
        }
        for (let i = 0; i < parsedCode.length; i++) {  //insert data into chart
            table_row = chart.insertRow(-1);
            for (let j = 0; j < columns.length; j++) {
                let tabCell = table_row.insertCell(-1);
                tabCell.innerHTML = parsedCode[i][columns[j]];
            }}});
});
