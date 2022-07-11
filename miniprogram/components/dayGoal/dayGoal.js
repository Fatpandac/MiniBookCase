Component({
  properties: {
    dayProcess: {
      type: Array,
      value: Array(7).fill(false),
    },
  },

  data: {
    today: new Date().getDay(),
  },

  methods: {},
});
