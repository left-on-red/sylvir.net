$(async function() {
    let postContainer = $('#postContainer');
    let posts = await (await (fetch('/blog/api'))).json();
    for (let p = 0; p < posts.length; p++) {
        let date = new Date(posts[p].meta.timestamp);
        date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear() - 2000}`;
        let title = posts[p].meta.title;
        let id = posts[p].id;
        let postDiv = $(
            `<a class="blogpost" href="/blog/${id}">
                <div class="header">
                    <span class="date">${date}</span><span class="title">${title}</span>
                </div>
                <p class="description">${posts[p].meta.description}</p>
            </a>`
        );

        postContainer.append(postDiv);
    }
});