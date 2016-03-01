<style>
    .fade-transition {
        transition: all 0.2s ease;
    }

    .fade-enter {
        opacity: 0;
    }

    .fade-leave {
        opacity: 0;
    }
</style>

<template>
    <div>
        <router-view transition="fade" transition-mode="out-in"></router-view>
    </div>
</template>

<script>
    module.exports = {};
</script>