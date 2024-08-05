import qs from 'qs';

const queryObject_main = {
  populate: {
    Location: true,
    Industry: true,
    Image: true,
    CoverImage: true,
    Projects: {
      filters: {
        Highlight_Flag: {
          $eq: true
        }
      },
      populate: {
        Project: {
          populate: {
            Category: true,
            Image: true,
            CoverImage: true,
            Companies: {
              populate: {
                Company: {
                  populate: ['Location']
                }
              }
            }
          }
        }
      }
    }
  },
  pagination: {
      pageSize: 100,
    },
}

const qs_main = qs.stringify(queryObject_main, {encodeValuesOnly: true});

export { qs_main };