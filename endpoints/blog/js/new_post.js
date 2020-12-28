$(function() {
    if (!localStorage.getItem('token')) { window.location.href = '/' }

    // https://github.com/quilljs/quill/issues/1993#issuecomment-670258840
    // (removes syntax highlights code-block is turned off for a block of text)
    let _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
    const CodeBlock = Quill.import('formats/code-block');
    class NewCodeBlock extends CodeBlock {
        replaceWith(block) {
            this.domNode.textContent = this.domNode.textContent;
            this.attach();
            let newItem = _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replaceWith', this).call(this, block);
            newItem.domNode.textContent = newItem.domNode.textContent;
            this.scroll.update('silent');
        }
    }
    NewCodeBlock.className = 'ql-syntax';
    Quill.register(NewCodeBlock, true);

    hljs.configure({
        languages: ['javascript']
    });

    let editorContainer = $('#editorContainer');
    let previewContainer = $('#previewContainer');
    let previewBody = $('#previewBody');
    let titleInput = $('#titleInput');
    let descriptionInput = $('#description');
    let viewSwitch = $('#viewSwitch');
    let submitPost = $('#submitPost');
    
    let quill = new Quill('#editor', {
        formats: [
            'bold',
            'header',
            'italic',
            'underline',
            'strike',
            'link',
            'list',
            'image',
            'code-block'
        ],
        modules: {
            syntax: true,
            toolbar: [
                [ { header: [1, 2, 3, 4, 5, 6, false] } ],
                [ 'bold', 'italic', 'underline', 'strike' ],
                [ { 'list' : 'ordered' }, { 'list' : 'bullet' } ],
                [ 'link', 'image', 'code-block' ]
            ]
        },

        placeholder: 'compose your blog post...',
        theme: 'snow'
    });

    let md = window.markdownit();
    md.set({ html: true });

    let markdown = '';

    function validate() {
        localStorage.setItem('post-body', quill.container.firstChild.innerHTML);
        localStorage.setItem('post-title', titleInput.val());
        localStorage.setItem('post-description', descriptionInput.text());

        if (markdown != '' && titleInput.val() != '' && descriptionInput.text() != '') { viewSwitch.attr('disabled', false) }
        else { viewSwitch.attr('disabled', true) }
    }

    quill.on('text-change', function(delta, source) {
        let html = quill.container.firstChild.innerHTML;
        markdown = toMarkdown(html, {
            converters: [{
                filter: 'pre',
                // just wraps all of the plain text inside <pre></pre> into markdown code blocks
                replacement: function(content) {
                    return `\n\`\`\`\n${content.replace(/<[^>]*>/g, '')}\`\`\`\n`;
                }
            }]
        });

        //console.log(md.render(markdown));

        previewBody.html(md.render(markdown));
        let blocks = previewBody.find('pre code');
        for (let b = 0; b < blocks.length; b++) { hljs.highlightBlock(blocks[b]) }

        validate();
    });


    titleInput.keydown(validate);
    titleInput.keyup(validate);

    // because the description input isn't actually an input element, standard jquery key events don't work
    descriptionInput.bind('DOMSubtreeModified', validate);

    let editing = true;

    function render() {
        editorContainer.hide();
        previewContainer.hide();

        if (editing) { editorContainer.show() }
        else { previewContainer.show() }
    }

    viewSwitch.click(function() {
        if (!viewSwitch.attr('disabled')) {
            if (editing == true) {
                viewSwitch.text('edit');
                editing = false;
            }

            else {
                viewSwitch.text('preview');
                editing = true;
            }

            render();
        }
    })

    //$(window).bind('beforeunload', function() {
    //    if (markdown != '') { return true }
    //});

    submitPost.click(async function() {
        let response = await fetch(`/blog/api`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },

            body: JSON.stringify({ md: markdown.replace(/(<([^>]+)>)/gi, '').replace('**_﻿_**', ''), title: titleInput.val(), description: descriptionInput.text(), tags: [] })
        });

        localStorage.removeItem('post-body');
        localStorage.removeItem('post-title');
        localStorage.removeItem('post-description');

        let id = (await response.json()).id;
        window.location.href = `/blog/${id}`;
    });

    if (localStorage.getItem('post-body')) {
        let html = localStorage.getItem('post-body');
        quill.container.firstChild.innerHTML = html;

        //let blocks = $(quill.container.firstChild).find('pre code');
        //for (let b = 0; b < blocks.length; b++) { hljs.highlightBlock(blocks[b]) }
    }

    if (localStorage.getItem('post-title')) { titleInput.val(localStorage.getItem('post-title')) }
    if (localStorage.getItem('post-description')) { descriptionInput.text(localStorage.getItem('post-description')) }

    render();
});