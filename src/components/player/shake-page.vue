<template>
    <div>shake page</div>
</template>

<script>
    module.exports = {
        ready: function() {
            var router = this.$router;
            setTimeout(function() {
                router.go({name: 'ranking', params: {roomId: 'test'}});
            }, 1000);
        }
    };
</script>