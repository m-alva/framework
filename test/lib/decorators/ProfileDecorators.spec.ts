import { expect } from "chai";
import { Configuration, ConfigurationUtil } from "../../../src/lib/decorators/ConfigurationDecorator";
import { Profile, ActiveProfiles } from "../../../src/lib/decorators/ProfileDecorators";
import { ComponentUtil, Component } from "../../../src/lib/decorators/ComponentDecorator";

describe('ActiveProfilesDecorator', function () {

    it('should add active profiles', function () {
        // given / when
        @ActiveProfiles('profileOne', 'profileTwo')
        @ActiveProfiles('profileThree')
        @Configuration()
        class A { }

        // then
        let profiles = ConfigurationUtil.getConfigurationData(A)
            .properties.get('application.profiles.active').split(",");
        expect(profiles.length).to.be.eq(3);
        expect(profiles).to.include.members(['profileOne', 'profileTwo', 'profileThree']);
    });

    it('should throw when not on @Configuration', function () {
        // given
        class A {}

        // when / then
        expect(ActiveProfiles('someProfile').bind(this, A)).to.throw(Error);
    });
});

describe('ProfileDecorator', function () {

    it('should add profiles', function () {
        // given / when
        @Profile('profileOne', 'profileTwo')
        @Profile('profileThree')
        @Component()
        class A { }

        // then
        let profiles = ComponentUtil.getComponentData(A).profiles;
        expect(profiles.length).to.be.eq(3);
        expect(profiles).to.include.members(['profileOne', 'profileTwo', 'profileThree']);
    });

    it('should throw when not on @Component', function () {
        // given
        class A {}

        // when / then
        expect(Profile('someProfile').bind(this, A)).to.throw(Error);
    });
});