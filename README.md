# cacheRequest
请求并对get请求进行缓存

## usage

                networkRequest({
                    url: '/course/courseBanners',
                    method: 'get'
                }, response => {
                   
                }, {
                    cacheName: CACHE_NAME.COURSE_BANNER_LIST.NAME,
                    cacheTime: CACHE_NAME.COURSE_BANNER_LIST.TIME,
                    isNow: isNow
                });
