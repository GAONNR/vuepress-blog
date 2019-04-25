vuepress build docs

echo blog.g40n.xyz > docs/.vuepress/dist/CNAME

git add docs/.vuepress/dist && git commit -m "Deploy"

git subtree push --prefix docs/.vuepress/dist origin gh-pages