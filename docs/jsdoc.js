// BigInt JSON serialization.
BigInt.prototype.toJSON = function() {
	return this.toString() + 'n';
}

module.exports = {
    plugins: ['plugins/markdown'],
    source: {
        include: [ "src" ],
        includePattern: ".+\\.js(doc|x)?$",
        excludePattern: "(^|\\/|\\\\)_"
    },
    templates: {
        default: {
          includeDate: false,
          outputSourceFiles: true
        }
    },
    opts: {
        template: "node_modules/docdash",
        destination: "./docs/web",
        recurse: true,
        readme: "README.md",
        tutorials: "docs/src",
    },
    docdash: {
        search: true,
        collapse: true,
        typedefs: true,
        meta: {
            title: "Alpinejs-app Documentation",
            description: "A Simplest Single Page Application (SPA) library for Alpine.js.",
        },
        tutorialsOrder: ["start", "components", "directives", "magics"],
    }
};
