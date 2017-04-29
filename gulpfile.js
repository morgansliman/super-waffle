const gulp = require('gulp')
const babel = require('gulp-babel')

const config = {
	js: {
		server: {
			src: 'src/server/**/*.js',
			dest: 'dist/server'
		}
	},
	resources: {
		files: {
			src: ['src/client/index.html'],
			dest: 'dist/client'
		}
	}
}

gulp.task('js:server', () => {
	return gulp.src(config.js.server.src)
		.pipe(babel())
		.pipe(gulp.dest(config.js.server.dest))
})

gulp.task('copy-files', () => {
	return gulp.src(config.resources.files.src)
		.pipe(gulp.dest(config.resources.files.dest))
})

gulp.task('setup', ['js:server', 'copy-files'], () => {
	console.log('Setup complete. Run `npm start` to start server.')
})

gulp.task('default', ['js:server', 'copy-files'], () => {
	gulp.watch(config.js.server.src, ['js:server'])
})