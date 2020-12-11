$(function() {
    let container = $('.container');
    let blocks = container.find('pre code');
    for (let b = 0; b < blocks.length; b++) { blocks[b].classList.add('js'); hljs.highlightBlock(blocks[b]) }
});