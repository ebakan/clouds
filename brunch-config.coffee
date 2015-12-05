exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo: 'dummy.js'
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'dummy.js'
  plugins:
    browserify:
      # A string of extensions that will be used in Brunch and for browserify.
      # Default: js json coffee ts jsx hbs jade.
      extensions: "js"
      transforms: [require('babelify').configure(presets: ["es2015", "react"])]

      bundles:
        'app.js':
          # Passed to browserify.
          entry: 'app/index.js'

          # Anymatch, as used in Brunch.
          matcher: /^app/

          # Direct access to the browserify bundler to do anything you need.
          onBrowserifyLoad: (bundler) -> console.log 'onWatchifyLoad'

          # Any files watched by browserify won't be in brunch's regular
          # pipeline. If you do anything before your javascripts are compiled,
          # now's the time.
          onBeforeBundle: (bundler) -> console.log 'onBeforeBundle'

          # Any files watched by browserify won't be in brunch's regular
          # pipeline. If you do anything after your javascripts are compiled,
          # now's the time.
          onAfterBundle: (error, bundleContents) -> console.log 'onAfterBundle'

          # Any options to pass to `browserify`.
          # `debug` will be set to `!production` if not already defined.
          # `extensions` will be set to a proper list of
          # `plugins.browserify.extensions`
          instanceOptions: {}
    jade:
      pretty: yes
  modules:
    wrapper: false
    definition: false
