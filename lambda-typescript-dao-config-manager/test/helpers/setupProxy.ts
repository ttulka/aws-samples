// for local testing
(function setupProxy() {
    if (process.env.HTTPS_PROXY) {
        require('aws-sdk').config.update({
            httpOptions: {agent: require('proxy-agent')(process.env.HTTPS_PROXY)}
        });
    }
})();