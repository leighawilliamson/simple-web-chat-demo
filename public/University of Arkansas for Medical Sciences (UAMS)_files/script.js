/*-----------------
	Components
-----------------*/

// Parent | Subreddit component containing a list of 'post' components.
var uamsnews = Vue.component('uamsnews',{
	template: '#uamsnews',
	props: ['category','count','title'],

	data: function () {
		return {
			posts: [],
			loader: true
		}
	},

	created: function(){
		this.$http.get("https://news.uams.edu/wp-json/wp/v2/posts/?_embed&per_page=" + this.count + "&categories=" + this.category )
		.then(function(resp){
		    if(typeof resp.data == 'string') {
		       resp.data = JSON.parse(resp.data);
		    }
		    this.posts=resp.data;
		    this.loader = false;
		    //console.log(this.posts);
		});
	}
});


// Child | Componenet representing a single post.
var post = Vue.component('post', {
	template: "#post",
	props: ['item']
});


var header = Vue.component('hero', {
	template: "#hero",
	props: ['herobg'],

	data: function () {
		return {
			bgimages: [],
			imageurl: '',
			imgtitle: '',
			imgcolor: '',
			imgtext: '',
			imgbutton: '',
			imgbuttontxt: '',
			imgbuttonurl: '',
			imgbuttoncolor: '',
			loading: true
		}
	},

	mounted: function() {
		this.getPosts();
	},
	methods: {
		getImageBackgroundCSS: function(img) {
			//console.log(img);
			if(img) {
				return 'background-image: url("' + img + '"); background-position: center center;';
			}
			else {
				return 'background-color: #767475;';
			}
		},
		getPosts: function() {
			this.$http.get("//web.uams.edu/wp-json/wp/v2/posts/?_embed&per_page=3&categories=11" )
			.then(function(resp){
			    if(typeof resp.data == 'string') {
			       resp.data = JSON.parse(resp.data);
			    }
			    this.loading = false;
			    this.bgimages=resp.data;
			    rndimg = Math.floor(Math.random()* Number(resp.data.length) );
			    this.imageurl = this.bgimages[rndimg].acf.home_header_image.url;
			    this.imgtitle = this.bgimages[rndimg].acf.home_header_title;
			    this.imgcolor = this.bgimages[rndimg].acf.home_text_color;
			    this.imgtext = this.bgimages[rndimg].acf.home_header_text;
			    this.imgbutton = this.bgimages[rndimg].acf.home_add_button;
			    this.imgbuttontxt = this.bgimages[rndimg].acf.home_button_text;
			    this.imgbuttonurl = this.bgimages[rndimg].acf.home_button_url;
			    this.imgbuttoncolor = this.bgimages[rndimg].acf.home_button_color;
			    // console.log(rndimg);
			    // console.log( this.imageurl );
			    // console.log( this.imgcolor )
			    // console.log( this.imgtext );
			    // console.log( this.imgbuttontxt );
			    // console.log( this.imgbuttonurl );
			});
		}
	}
})


/*-----------------
   Custom filters
-----------------*/


// Filter that transform text to uppercase.
Vue.filter('uppercase', function(value) {
    return value.toUpperCase();
});


// Filter for cutting off strings that are too long.
Vue.filter('truncate', function(value, length) {
	if (!length) {
		length = 180;
	}

	if(value.length <= length) {
		return value;
	}
	else {
		return value.substring(0, length) + '...';
	}
});

Vue.filter('formatDate', function(value) {
    if (value) {
    	return makeLongAP(String(value));
  	}
});

/*-----------------
   AP Style Date
-----------------*/
const apMonthsList = ["Jan.","Feb.","March","April","May","June","July","Aug.","Sept.","Oct.","Nov.","Dec."];

const getDateObjects = function(date) {
    const dateObj = new Date(Date.parse(date));
    const day = dateObj.getUTCDate();
    const month = apMonthsList[dateObj.getUTCMonth()];
    const year = dateObj.getFullYear();

    return {
      "day": day,
      "month": month,
      "year": year,
    }
};

const makeShortAP = function(date) {
  const obj = getDateObjects(date);
  const month = obj.month;
  const day = obj.day;
  return month + " " + day;
};

const makeLongAP = function(date) {
  const obj = getDateObjects(date);
  const day = obj.day;
  const month = obj.month;
  const year = obj.year;
  return month + " " + day + ", " + year;
};


/*-----------------
   Initialize app
-----------------*/

var vm1 = new Vue({
	el: '#app'
});

var vm2 = new Vue({
	el: '#main'
});
